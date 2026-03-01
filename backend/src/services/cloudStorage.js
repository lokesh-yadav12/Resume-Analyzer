const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage provider enum
const STORAGE_PROVIDERS = {
  S3: 'S3',
  CLOUDINARY: 'CLOUDINARY',
  LOCAL: 'LOCAL'
};

// Get current storage provider from environment
const getStorageProvider = () => {
  const provider = process.env.STORAGE_PROVIDER || 'LOCAL';
  return STORAGE_PROVIDERS[provider] || STORAGE_PROVIDERS.LOCAL;
};

// Upload file to AWS S3
const uploadToS3 = async (filePath, fileName, options = {}) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('AWS S3 bucket name not configured');
    }
    
    const params = {
      Bucket: bucketName,
      Key: `resumes/${fileName}`,
      Body: fileContent,
      ContentType: options.contentType || 'application/octet-stream',
      ServerSideEncryption: 'AES256',
      Metadata: {
        originalName: options.originalName || fileName,
        uploadedBy: options.userId || 'unknown',
        uploadedAt: new Date().toISOString()
      }
    };
    
    const result = await s3.upload(params).promise();
    
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      etag: result.ETag,
      provider: 'S3'
    };
    
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, fileName, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'career-boost/resumes',
      public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
      resource_type: 'raw', // For non-image files
      context: {
        originalName: options.originalName || fileName,
        uploadedBy: options.userId || 'unknown',
        uploadedAt: new Date().toISOString()
      },
      tags: ['resume', 'document']
    });
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      provider: 'CLOUDINARY'
    };
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Main upload function that routes to appropriate provider
const uploadFile = async (filePath, fileName, options = {}) => {
  const provider = getStorageProvider();
  
  try {
    let result;
    
    switch (provider) {
      case STORAGE_PROVIDERS.S3:
        result = await uploadToS3(filePath, fileName, options);
        break;
        
      case STORAGE_PROVIDERS.CLOUDINARY:
        result = await uploadToCloudinary(filePath, fileName, options);
        break;
        
      case STORAGE_PROVIDERS.LOCAL:
      default:
        // For local storage, just return the local path
        result = {
          success: true,
          url: filePath,
          provider: 'LOCAL'
        };
        break;
    }
    
    // Clean up local file after successful cloud upload
    if (provider !== STORAGE_PROVIDERS.LOCAL && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up local file: ${filePath}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`File upload failed with provider ${provider}:`, error);
    throw error;
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      throw new Error('AWS S3 bucket name not configured');
    }
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    
    return {
      success: true,
      provider: 'S3'
    };
    
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`S3 delete failed: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    
    return {
      success: result.result === 'ok',
      provider: 'CLOUDINARY'
    };
    
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Delete file from local storage
const deleteFromLocal = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return {
        success: true,
        provider: 'LOCAL'
      };
    }
    return {
      success: false,
      error: 'File not found',
      provider: 'LOCAL'
    };
  } catch (error) {
    console.error('Local delete error:', error);
    throw new Error(`Local delete failed: ${error.message}`);
  }
};

// Main delete function
const deleteFile = async (fileUrl, fileKey = null, publicId = null) => {
  const provider = getStorageProvider();
  
  try {
    switch (provider) {
      case STORAGE_PROVIDERS.S3:
        if (!fileKey) {
          // Extract key from URL if not provided
          const urlParts = fileUrl.split('/');
          fileKey = urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)
        }
        return await deleteFromS3(fileKey);
        
      case STORAGE_PROVIDERS.CLOUDINARY:
        if (!publicId) {
          // Extract public ID from URL if not provided
          const urlParts = fileUrl.split('/');
          const filename = urlParts[urlParts.length - 1];
          publicId = `career-boost/resumes/${filename.replace(/\.[^/.]+$/, '')}`;
        }
        return await deleteFromCloudinary(publicId);
        
      case STORAGE_PROVIDERS.LOCAL:
      default:
        return deleteFromLocal(fileUrl);
    }
  } catch (error) {
    console.error(`File deletion failed with provider ${provider}:`, error);
    throw error;
  }
};

// Generate signed URL for S3 (for temporary access)
const generateSignedUrl = async (key, expiresIn = 3600) => {
  const provider = getStorageProvider();
  
  if (provider !== STORAGE_PROVIDERS.S3) {
    throw new Error('Signed URLs are only supported for S3 storage');
  }
  
  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn
    };
    
    const url = await s3.getSignedUrlPromise('getObject', params);
    
    return {
      success: true,
      url,
      expiresIn
    };
    
  } catch (error) {
    console.error('S3 signed URL generation error:', error);
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }
};

// Get file metadata
const getFileMetadata = async (fileUrl, fileKey = null) => {
  const provider = getStorageProvider();
  
  try {
    switch (provider) {
      case STORAGE_PROVIDERS.S3:
        if (!fileKey) {
          const urlParts = fileUrl.split('/');
          fileKey = urlParts.slice(-2).join('/');
        }
        
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileKey
        };
        
        const result = await s3.headObject(params).promise();
        
        return {
          success: true,
          size: result.ContentLength,
          lastModified: result.LastModified,
          contentType: result.ContentType,
          metadata: result.Metadata,
          provider: 'S3'
        };
        
      case STORAGE_PROVIDERS.CLOUDINARY:
        // Cloudinary doesn't have a direct metadata API for raw files
        // You would need to use the Admin API or store metadata separately
        return {
          success: false,
          error: 'Metadata retrieval not implemented for Cloudinary',
          provider: 'CLOUDINARY'
        };
        
      case STORAGE_PROVIDERS.LOCAL:
      default:
        if (fs.existsSync(fileUrl)) {
          const stats = fs.statSync(fileUrl);
          return {
            success: true,
            size: stats.size,
            lastModified: stats.mtime,
            provider: 'LOCAL'
          };
        }
        return {
          success: false,
          error: 'File not found',
          provider: 'LOCAL'
        };
    }
  } catch (error) {
    console.error('Get file metadata error:', error);
    throw error;
  }
};

// Health check for storage providers
const healthCheck = async () => {
  const provider = getStorageProvider();
  const results = {
    provider,
    status: 'unknown',
    details: {}
  };
  
  try {
    switch (provider) {
      case STORAGE_PROVIDERS.S3:
        const bucketName = process.env.AWS_S3_BUCKET;
        if (!bucketName) {
          throw new Error('S3 bucket not configured');
        }
        
        await s3.headBucket({ Bucket: bucketName }).promise();
        results.status = 'healthy';
        results.details.bucket = bucketName;
        break;
        
      case STORAGE_PROVIDERS.CLOUDINARY:
        // Simple ping to Cloudinary
        await cloudinary.api.ping();
        results.status = 'healthy';
        results.details.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        break;
        
      case STORAGE_PROVIDERS.LOCAL:
      default:
        const uploadDir = path.join(__dirname, '../../uploads');
        if (fs.existsSync(uploadDir)) {
          results.status = 'healthy';
          results.details.uploadDir = uploadDir;
        } else {
          results.status = 'unhealthy';
          results.details.error = 'Upload directory not found';
        }
        break;
    }
  } catch (error) {
    results.status = 'unhealthy';
    results.details.error = error.message;
  }
  
  return results;
};

module.exports = {
  uploadFile,
  deleteFile,
  generateSignedUrl,
  getFileMetadata,
  healthCheck,
  STORAGE_PROVIDERS,
  getStorageProvider
};