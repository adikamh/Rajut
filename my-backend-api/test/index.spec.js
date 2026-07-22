import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";

describe("Cloudflare D1 & R2 Backend API Tests", () => {
	beforeAll(async () => {
		if (env.DB) {
			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					address TEXT NOT NULL,
					phone TEXT NOT NULL,
					email TEXT UNIQUE NOT NULL,
					password TEXT NOT NULL,
					role TEXT DEFAULT 'user',
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`).run();

			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS gallery (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					image_url TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`).run();

			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS projects (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					title TEXT NOT NULL,
					description TEXT NOT NULL,
					image_url TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`).run();

			await env.DB.prepare(`
				CREATE TABLE IF NOT EXISTS contact_messages (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					email TEXT NOT NULL,
					message TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				);
			`).run();
		}
	});

	it("1. Register User & Verifikasi Login dari D1 Database", async () => {
		const ctx = createExecutionContext();

		// Register
		const registerReq = new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Tes User D1",
				address: "Jl. Tes Cloudflare No. 1",
				phone: "08123456789",
				email: "tesuserd1@gmail.com",
				password: "password123",
				role: "user"
			})
		});

		const regRes = await worker.fetch(registerReq, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(regRes.status).toBe(201);
		const regData = await regRes.json();
		expect(regData).toHaveProperty("token");
		expect(regData.user.email).toBe("tesuserd1@gmail.com");

		// Verifikasi data terdaftar di D1
		if (env.DB) {
			const dbUser = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
				.bind("tesuserd1@gmail.com").first();
			expect(dbUser).not.toBeNull();
			expect(dbUser.name).toBe("Tes User D1");
		}

		// Login
		const loginReq = new Request("http://localhost/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "tesuserd1@gmail.com",
				password: "password123"
			})
		});

		const loginRes = await worker.fetch(loginReq, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(loginRes.status).toBe(200);
		const loginData = await loginRes.json();
		expect(loginData).toHaveProperty("token");
		expect(loginData.user.email).toBe("tesuserd1@gmail.com");
	});

	it("2. Upload Foto Gambar ke Cloudflare R2 Bucket & Simpan Metadata ke D1 Gallery", async () => {
		const ctx = createExecutionContext();

		// Register admin
		const adminReg = new Request("http://localhost/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "Admin D1",
				address: "Kantor Admin",
				phone: "08999999999",
				email: "admind1@tokorajut.com",
				password: "adminpassword",
				role: "admin"
			})
		});
		const adminRes = await worker.fetch(adminReg, env, ctx);
		const adminData = await adminRes.json();
		const adminToken = adminData.token;

		// Form Data Upload Gambar
		const formData = new FormData();
		const dummyBlob = new Blob(["test-image-content-bytes"], { type: "image/jpeg" });
		formData.append("image", dummyBlob, "foto-test-rajut.jpg");

		const uploadReq = new Request("http://localhost/api/gallery", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${adminToken}`
			},
			body: formData
		});

		const res = await worker.fetch(uploadReq, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(res.status).toBe(201);
		const galleryItem = await res.json();
		expect(galleryItem).toHaveProperty("image_url");
		expect(galleryItem.image_url).toContain("/api/uploads/");

		// Verifikasi File Gambar masuk di Cloudflare R2 Bucket
		const fileKey = galleryItem.image_url.replace("/api/uploads/", "");
		if (env.BUCKET) {
			const r2Object = await env.BUCKET.get(fileKey);
			expect(r2Object).not.toBeNull();
			const content = await r2Object.text();
			expect(content).toBe("test-image-content-bytes");
		}

		// Verifikasi Record Gallery masuk di Cloudflare D1 Database
		if (env.DB) {
			const dbGallery = await env.DB.prepare("SELECT * FROM gallery WHERE id = ?")
				.bind(galleryItem.id).first();
			expect(dbGallery).not.toBeNull();
			expect(dbGallery.image_url).toBe(galleryItem.image_url);
		}
	});

	it("3. Serve / Download Foto dari R2 Bucket via Endpoint /api/uploads/:key", async () => {
		const ctx = createExecutionContext();

		const testKey = "test_serve_photo.jpg";
		if (env.BUCKET) {
			await env.BUCKET.put(testKey, "dummy-photo-bytes", {
				httpMetadata: { contentType: "text/plain" }
			});
		}

		const serveReq = new Request(`http://localhost/api/uploads/${testKey}`, {
			method: "GET"
		});

		const res = await worker.fetch(serveReq, env, ctx);
		await waitOnExecutionContext(ctx);

		if (env.BUCKET) {
			expect(res.status).toBe(200);
			const text = await res.text();
			expect(text).toBe("dummy-photo-bytes");
		}
	});
});
