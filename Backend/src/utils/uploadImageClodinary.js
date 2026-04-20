import ImageKit from 'imagekit';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImageClodinary = async (image) => {
    if (!image) {
        throw new Error('No image provided for upload');
    }

    if (image.mimetype && !ALLOWED_MIME_TYPES.has(image.mimetype)) {
        throw new Error(`Unsupported image type: ${image.mimetype}. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`);
    }

    const buffer = image.buffer || Buffer.from(await image.arrayBuffer());
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error('Image buffer is empty or invalid');
    }

    const fileName = image.originalname || `product_${Date.now()}`;

    const uploadResult = await imagekit.upload({
        file: buffer,
        fileName: fileName,
        folder: '/divinekart/products',
    });

    return uploadResult;
};

export default uploadImageClodinary;
