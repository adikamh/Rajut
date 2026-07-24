import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rajut_secret_token_key_123!';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'application/json',
		},
	});
}

function errorResponse(message, status = 400) {
	return jsonResponse({ error: message }, status);
}

function generateToken(user, secret) {
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		secret || JWT_SECRET,
		{ expiresIn: '7d' }
	);
}

function getAuthUser(request, secret) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
	const token = authHeader.split(' ')[1];
	try {
		return jwt.verify(token, secret || JWT_SECRET);
	} catch (e) {
		return null;
	}
}

async function saveFileToR2(env, file) {
	if (!file || typeof file === 'string') return file;
	const extension = file.name ? file.name.split('.').pop() : 'jpg';
	const key = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
	const arrayBuffer = await file.arrayBuffer();

	if (env.BUCKET) {
		await env.BUCKET.put(key, arrayBuffer, {
			httpMetadata: { contentType: file.type || 'image/jpeg' },
		});
		return `/api/uploads/${key}`;
	}
	return file.name || 'image.jpg';
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS Preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		try {
			// ================= 1. SERVE R2 UPLOADS =================
			if (path.startsWith('/api/uploads/') && method === 'GET') {
				const key = path.replace('/api/uploads/', '');
				if (!env.BUCKET) {
					return errorResponse('R2 Bucket (BUCKET) is not configured', 500);
				}
				const object = await env.BUCKET.get(key);
				if (!object) {
					return errorResponse('File not found in R2', 404);
				}
				const headers = new Headers(corsHeaders);
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				return new Response(object.body, { headers });
			}

			// Check D1 DB binding
			if (!env.DB) {
				// Fallback mockup response if D1 is not yet bound
				if (path === '/api/projects' && method === 'GET') {
					return jsonResponse([]);
				}
				if (path === '/api/gallery' && method === 'GET') {
					return jsonResponse([]);
				}
				return jsonResponse({ message: 'Cloudflare Worker running. Note: D1 database binding (env.DB) is required for full functionality.' });
			}

			// ================= 2. AUTH ROUTES =================
			if (path === '/api/auth/register' && method === 'POST') {
				const body = await request.json();
				const { name, address, phone, email, password, role } = body;

				if (!name || !address || !phone || !email || !password) {
					return errorResponse('Seluruh kolom pendaftaran harus diisi!');
				}

				const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
				if (existingUser) {
					return errorResponse('Email sudah terdaftar!');
				}

				const finalRole = (role === 'admin' || role === 'user') ? role : 'user';
				const hashedPassword = bcrypt.hashSync(password, 10);

				const result = await env.DB.prepare(
					'INSERT INTO users (name, address, phone, email, password, role) VALUES (?, ?, ?, ?, ?, ?)'
				).bind(name, address, phone, email, hashedPassword, finalRole).run();

				const newUserId = result.meta.last_row_id;
				const newUser = { id: newUserId, name, email, role: finalRole };
				const token = generateToken(newUser, env.JWT_SECRET);

				return jsonResponse({ token, user: newUser }, 201);
			}

			if (path === '/api/auth/login' && method === 'POST') {
				const body = await request.json();
				const { email, password } = body;

				if (!email || !password) {
					return errorResponse('Email dan password harus diisi!');
				}

				const user = await env.DB.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').bind(email).first();
				if (!user) {
					return errorResponse('Email atau password salah!');
				}

				const isMatch = bcrypt.compareSync(password, user.password);
				if (!isMatch) {
					return errorResponse('Email atau password salah!');
				}

				const matchedUser = { id: user.id, name: user.name, email: user.email, role: user.role };
				const token = generateToken(matchedUser, env.JWT_SECRET);

				return jsonResponse({ token, user: matchedUser });
			}

			if (path === '/api/auth/reset-password' && method === 'POST') {
				const body = await request.json();
				const { email, newPassword } = body;

				if (!email || !newPassword) {
					return errorResponse('Email dan kata sandi baru harus diisi!');
				}

				if (newPassword.length < 4) {
					return errorResponse('Kata sandi baru minimal 4 karakter!');
				}

				const user = await env.DB.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').bind(email).first();
				if (!user) {
					return errorResponse('Alamat email tidak terdaftar dalam sistem!', 404);
				}

				const hashedPassword = bcrypt.hashSync(newPassword, 10);
				await env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashedPassword, user.id).run();

				return jsonResponse({ message: 'Kata sandi berhasil diperbarui! Silakan login dengan password baru Anda.' });
			}

			// ================= 3. GALLERY ROUTES =================
			if (path === '/api/gallery' && method === 'GET') {
				const { results: galleryRows } = await env.DB.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
				const { results: projectRows } = await env.DB.prepare('SELECT id, image_url, created_at FROM projects').all();

				const existingUrls = new Set((galleryRows || []).map(g => g.image_url));
				const combined = [...(galleryRows || [])];

				if (projectRows && projectRows.length > 0) {
					for (const p of projectRows) {
						if (!p.image_url) continue;
						let urls = [];
						try {
							if (p.image_url.startsWith('[')) {
								urls = JSON.parse(p.image_url);
							} else {
								urls = [p.image_url];
							}
						} catch (e) {
							urls = [p.image_url];
						}
						for (const url of urls) {
							if (url && !existingUrls.has(url)) {
								existingUrls.add(url);
								combined.push({
									id: `proj-${p.id}`,
									image_url: url,
									created_at: p.created_at || new Date().toISOString()
								});
							}
						}
					}
				}

				return jsonResponse(combined);
			}

			if (path === '/api/gallery' && method === 'POST') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				let imageUrl = '';
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					const file = formData.get('image');
					const bodyUrl = formData.get('image_url');

					if (file && typeof file !== 'string' && file.size > 0) {
						imageUrl = await saveFileToR2(env, file);
					} else if (bodyUrl) {
						imageUrl = bodyUrl;
					}
				} else {
					const body = await request.json();
					imageUrl = body.image_url || '';
				}

				if (!imageUrl) {
					return errorResponse('No image file or URL provided');
				}

				const result = await env.DB.prepare('INSERT INTO gallery (image_url) VALUES (?)')
					.bind(imageUrl).run();

				const inserted = await env.DB.prepare('SELECT * FROM gallery WHERE id = ?')
					.bind(result.meta.last_row_id).first();

				return jsonResponse(inserted, 201);
			}

			if (path.startsWith('/api/gallery/') && method === 'PUT') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				const id = path.split('/')[3];
				let imageUrl = '';
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					const file = formData.get('image');
					const bodyUrl = formData.get('image_url');

					if (file && typeof file !== 'string' && file.size > 0) {
						imageUrl = await saveFileToR2(env, file);
					} else if (bodyUrl) {
						imageUrl = bodyUrl;
					}
				} else {
					const body = await request.json();
					imageUrl = body.image_url || '';
				}

				if (!imageUrl) {
					return errorResponse('No image file or URL provided');
				}

				await env.DB.prepare('UPDATE gallery SET image_url = ? WHERE id = ?')
					.bind(imageUrl, id).run();

				const updated = await env.DB.prepare('SELECT * FROM gallery WHERE id = ?')
					.bind(id).first();

				return jsonResponse(updated);
			}

			if (path.startsWith('/api/gallery/') && method === 'DELETE') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				const id = path.split('/')[3];
				await env.DB.prepare('DELETE FROM gallery WHERE id = ?').bind(id).run();
				return jsonResponse({ message: 'Gallery item deleted successfully' });
			}

			// ================= 4. PROJECTS ROUTES =================
			if (path === '/api/projects' && method === 'GET') {
				const { results } = await env.DB.prepare('SELECT * FROM projects ORDER BY id DESC').all();
				return jsonResponse(results || []);
			}

			if (path === '/api/projects' && method === 'POST') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				let title = '';
				let description = '';
				let imageUrls = [];
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					title = formData.get('title');
					description = formData.get('description');

					// Handle multiple files via 'images' field (matches frontend)
					const files = formData.getAll('images');
					for (const file of files) {
						if (file && typeof file !== 'string' && file.size > 0) {
							const savedUrl = await saveFileToR2(env, file);
							if (savedUrl) imageUrls.push(savedUrl);
						}
					}

					// Backward compat: also check single 'image' field
					if (imageUrls.length === 0) {
						const singleFile = formData.get('image');
						if (singleFile && typeof singleFile !== 'string' && singleFile.size > 0) {
							const savedUrl = await saveFileToR2(env, singleFile);
							if (savedUrl) imageUrls.push(savedUrl);
						}
					}

					// Check for URL in form data
					const bodyUrl = formData.get('image_url');
					if (imageUrls.length === 0 && bodyUrl) {
						imageUrls = [bodyUrl];
					}
				} else {
					const body = await request.json();
					title = body.title;
					description = body.description;
					const rawUrl = (body.image_url || '').trim();
					if (rawUrl) {
						if (rawUrl.includes('\n')) {
							imageUrls = rawUrl.split('\n').map(u => u.trim()).filter(Boolean);
						} else if (rawUrl.includes(',') && !rawUrl.startsWith('http')) {
							imageUrls = rawUrl.split(',').map(u => u.trim()).filter(Boolean);
						} else {
							imageUrls = [rawUrl];
						}
					}
				}

				if (!title || !description) {
					return errorResponse('Title and description are required');
				}

				const storedImageUrl = imageUrls.length > 1 ? JSON.stringify(imageUrls) : (imageUrls[0] || null);

				const result = await env.DB.prepare(
					'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)'
				).bind(title, description, storedImageUrl).run();

				const inserted = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
					.bind(result.meta.last_row_id).first();

				// Sync all project photos to gallery table
				for (const url of imageUrls) {
					try {
						await env.DB.prepare('INSERT INTO gallery (image_url) VALUES (?)').bind(url).run();
					} catch (e) { /* ignore duplicate */ }
				}

				return jsonResponse(inserted, 201);
			}

			if (path.startsWith('/api/projects/') && method === 'PUT') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				const id = path.split('/')[3];

				// Get old image URLs for cleanup
				const existingProject = await env.DB.prepare('SELECT image_url FROM projects WHERE id = ?').bind(id).first();
				const oldImageUrl = existingProject ? existingProject.image_url : null;

				let title = '';
				let description = '';
				let imageUrls = [];
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					title = formData.get('title');
					description = formData.get('description');

					const files = formData.getAll('images');
					for (const file of files) {
						if (file && typeof file !== 'string' && file.size > 0) {
							const savedUrl = await saveFileToR2(env, file);
							if (savedUrl) imageUrls.push(savedUrl);
						}
					}

					if (imageUrls.length === 0) {
						const singleFile = formData.get('image');
						if (singleFile && typeof singleFile !== 'string' && singleFile.size > 0) {
							const savedUrl = await saveFileToR2(env, singleFile);
							if (savedUrl) imageUrls.push(savedUrl);
						}
					}

					const bodyUrl = formData.get('image_url');
					if (imageUrls.length === 0 && bodyUrl) {
						imageUrls = [bodyUrl];
					}
				} else {
					const body = await request.json();
					title = body.title;
					description = body.description;
					const rawUrl = (body.image_url || '').trim();
					if (rawUrl) {
						if (rawUrl.includes('\n')) {
							imageUrls = rawUrl.split('\n').map(u => u.trim()).filter(Boolean);
						} else if (rawUrl.includes(',') && !rawUrl.startsWith('http')) {
							imageUrls = rawUrl.split(',').map(u => u.trim()).filter(Boolean);
						} else {
							imageUrls = [rawUrl];
						}
					}
				}

				if (!title || !description) {
					return errorResponse('Title and description are required');
				}

				if (imageUrls.length > 0) {
					const storedImageUrl = imageUrls.length > 1 ? JSON.stringify(imageUrls) : imageUrls[0];
					await env.DB.prepare('UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?')
						.bind(title, description, storedImageUrl, id).run();

					// Clean up old gallery entries and add new ones
					if (oldImageUrl) {
						let oldUrls = [];
						try { oldUrls = oldImageUrl.startsWith('[') ? JSON.parse(oldImageUrl) : [oldImageUrl]; } catch (e) { oldUrls = [oldImageUrl]; }
						for (const oldUrl of oldUrls) {
							try { await env.DB.prepare('DELETE FROM gallery WHERE image_url = ?').bind(oldUrl).run(); } catch (e) {}
						}
					}
					for (const url of imageUrls) {
						try { await env.DB.prepare('INSERT INTO gallery (image_url) VALUES (?)').bind(url).run(); } catch (e) {}
					}
				} else {
					await env.DB.prepare('UPDATE projects SET title = ?, description = ? WHERE id = ?')
						.bind(title, description, id).run();
				}

				const updated = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
					.bind(id).first();

				return jsonResponse(updated);
			}

			if (path.startsWith('/api/projects/') && method === 'DELETE') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				const id = path.split('/')[3];

				// Clean up gallery entries for this project's photos
				const project = await env.DB.prepare('SELECT image_url FROM projects WHERE id = ?').bind(id).first();
				if (project && project.image_url) {
					let urls = [];
					try { urls = project.image_url.startsWith('[') ? JSON.parse(project.image_url) : [project.image_url]; } catch (e) { urls = [project.image_url]; }
					for (const url of urls) {
						try { await env.DB.prepare('DELETE FROM gallery WHERE image_url = ?').bind(url).run(); } catch (e) {}
					}
				}

				await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
				return jsonResponse({ message: 'Project deleted successfully' });
			}

			// ================= 5. CONTACT ROUTES =================
			if (path === '/api/contact' && method === 'POST') {
				const body = await request.json();
				const { name, email, message } = body;

				if (!name || !email || !message) {
					return errorResponse('All fields (name, email, message) are required');
				}

				const result = await env.DB.prepare(
					'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)'
				).bind(name, email, message).run();

				return jsonResponse({
					message: 'Message received and saved successfully',
					id: result.meta.last_row_id,
				}, 201);
			}

			return errorResponse('Endpoint not found', 404);
		} catch (err) {
			console.error('Worker Handler Error:', err);
			return errorResponse(err.message || 'Internal Server Error', 500);
		}
	},
};