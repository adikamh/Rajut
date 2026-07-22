import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ override: true });


const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so React frontend can make requests to this backend
app.use(cors());
app.use(express.json());

// 1. Konfigurasi Multer dengan Memory Storage (file disimpan sementara di RAM)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Batas ukuran file 10MB (opsional)
  }
});

// 2. Autentikasi Google (OAuth 2.0 User Refresh Token atau Service Account)
let driveAuthClient;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  driveAuthClient = oauth2Client;
  console.log('Google Drive API authenticated via OAuth 2.0 User Refresh Token.');
} else {
  const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || './bot/confident-topic-503106-d8-4df9b39b2205.json';
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  driveAuthClient = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  console.log('Google Drive API authenticated via Service Account.');
}

const drive = google.drive({ version: 'v3', auth: driveAuthClient });


/**
 * Helper function untuk mengubah Buffer dari Multer menjadi Readable Stream
 * karena googleapis memerlukan Stream untuk mengunggah media.
 */
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// 3. Endpoint POST /upload untuk menerima file foto
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    // Validasi apakah file ada dalam request
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Tidak ada file yang diunggah. Pastikan key form-data bernama "photo".' 
      });
    }

    // ID Folder Google Drive Tujuan
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const isPlaceholder = !folderId || folderId.includes('MASUKKAN_FOLDER_ID');

    // Metadata file yang akan disimpan di Google Drive
    const fileMetadata = {
      name: `${Date.now()}-${req.file.originalname}`,
      parents: !isPlaceholder ? [folderId] : []
    };


    // Konten media file dari memory storage buffer
    const media = {
      mimeType: req.file.mimetype,
      body: bufferToStream(req.file.buffer)
    };

    // Proses Unggah ke Google Drive
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    const fileId = driveResponse.data.id;

    // Opsional: Buat file dapat diakses publik (Read-only bagi siapapun yang punya link)
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.warn('Gagal mengubah izin akses file menjadi publik:', permError.message);
    }

    // 5. Respon Sukses (Status 200)
    return res.status(200).json({
      message: 'Foto berhasil diunggah ke Google Drive!',
      fileId: fileId,
      webViewLink: driveResponse.data.webViewLink,
      webContentLink: driveResponse.data.webContentLink
    });

  } catch (error) {
    console.error('Error saat mengunggah ke Google Drive:', error);
    
    // 5. Respon Gagal (Status 500)
    return res.status(500).json({
      error: 'Gagal mengunggah file ke Google Drive',
      details: error.message
    });
  }
});

// Jalankan Server Express
app.listen(PORT, () => {
  console.log(`Server Backend berjalan di http://localhost:${PORT}`);
});
