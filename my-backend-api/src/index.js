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
					return jsonResponse([
						{ id: 1, title: 'Cardigan Rajut Vintage', description: 'Handmade cardigan wol lembut', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96' },
						{ id: 2, title: 'Topi Kupluk Winter', description: 'Aksesoris hangat musim dingin', image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b' }
					]);
				}
				if (path === '/api/gallery' && method === 'GET') {
					return jsonResponse([
						{ id: 1, image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96' },
						{ id: 2, image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b' }
					]);
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

				const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
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

			// ================= 3. GALLERY ROUTES =================
			if (path === '/api/gallery' && method === 'GET') {
				const { results } = await env.DB.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
				return jsonResponse(results || []);
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
				let imageUrl = null;
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					title = formData.get('title');
					description = formData.get('description');
					const file = formData.get('image');
					const bodyUrl = formData.get('image_url');

					if (file && typeof file !== 'string' && file.size > 0) {
						imageUrl = await saveFileToR2(env, file);
					} else if (bodyUrl) {
						imageUrl = bodyUrl;
					}
				} else {
					const body = await request.json();
					title = body.title;
					description = body.description;
					imageUrl = body.image_url || null;
				}

				if (!title || !description) {
					return errorResponse('Title and description are required');
				}

				const result = await env.DB.prepare(
					'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)'
				).bind(title, description, imageUrl).run();

				const inserted = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
					.bind(result.meta.last_row_id).first();

				return jsonResponse(inserted, 201);
			}

			if (path.startsWith('/api/projects/') && method === 'PUT') {
				const authUser = getAuthUser(request, env.JWT_SECRET);
				if (!authUser || authUser.role !== 'admin') {
					return errorResponse('Akses ditolak: Admin role required', 403);
				}

				const id = path.split('/')[3];
				let title = '';
				let description = '';
				let imageUrl = null;
				const contentType = request.headers.get('content-type') || '';

				if (contentType.includes('multipart/form-data')) {
					const formData = await request.formData();
					title = formData.get('title');
					description = formData.get('description');
					const file = formData.get('image');
					const bodyUrl = formData.get('image_url');

					if (file && typeof file !== 'string' && file.size > 0) {
						imageUrl = await saveFileToR2(env, file);
					} else if (bodyUrl) {
						imageUrl = bodyUrl;
					}
				} else {
					const body = await request.json();
					title = body.title;
					description = body.description;
					imageUrl = body.image_url !== undefined ? body.image_url : null;
				}

				if (!title || !description) {
					return errorResponse('Title and description are required');
				}

				if (imageUrl !== null && imageUrl !== undefined) {
					await env.DB.prepare('UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?')
						.bind(title, description, imageUrl, id).run();
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