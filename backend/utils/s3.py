import boto3
import os
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class S3Client:
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(S3Client, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if S3Client._client is None:
            # Validar se as credenciais existem (suporta ambos formatos de env var)
            s3_id = os.getenv('S3_ID') or os.getenv('SUPABASE_S3_ID')
            s3_key = os.getenv('S3_KEY') or os.getenv('SUPABASE_S3_KEY')
            s3_endpoint = os.getenv('S3_ENDPOINT') or os.getenv('SUPABASE_S3_ENDPOINT')
            
            if not s3_id or not s3_key:
                raise ValueError(
                    "S3 credentials not found. Please set S3_ID and S3_KEY (or SUPABASE_S3_ID and SUPABASE_S3_KEY) environment variables. "
                    "Make sure .env file exists and is being loaded."
                )
            
            S3Client._client = boto3.client(
                's3',
                aws_access_key_id=s3_id,
                aws_secret_access_key=s3_key,
                endpoint_url=s3_endpoint,
                region_name=os.getenv('S3_REGION', 'us-east-1')
            )
            logger.info(f"S3 client initialized successfully with endpoint: {s3_endpoint}")

    def get_file_url(self, bucket, filename, expiration=3600):
        """Generate a presigned URL to share an S3 object

        :param filename: Name/key of the file in S3
        :param expiration: Time in seconds for the presigned URL to remain valid
        :return: Presigned URL as string. If error, returns None.
        """
        try:
            url = S3Client._client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': filename},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL for {filename}: {e}")
            return None

    def get_file(self, bucket, filename):
        """Download a file from S3 bucket

        :param filename: Name/key of the file to download
        :return: File content bytes if successful, else None
        """
        try:
            response = S3Client._client.get_object(Bucket=bucket, Key=filename)
            return response['Body'].read()
        except ClientError as e:
            logger.error(f"Error downloading file {filename} from bucket {bucket}: {e}")
            return None

    def upload_file(self, bucket, filename, file_data, content_type=None):
        """Upload a file to S3 bucket

        :param filename: S3 object key/name
        :param file_data: File content (bytes or file-like object)
        :param content_type: MIME type of the file
        :return: True if file was uploaded, else False
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            S3Client._client.put_object(
                Bucket=bucket,
                Key=filename,
                Body=file_data,
                **extra_args
            )
            logger.info(f"File {filename} uploaded successfully to {bucket}")
            return True
        except ClientError as e:
            logger.error(f"Error uploading file {filename} to bucket {bucket}: {e}")
            return False
    
    def delete_file(self, bucket, filename):
        """Delete a file from S3 bucket

        :param filename: Name/key of the file to delete
        :return: True if file was deleted, else False
        """
        try:
            S3Client._client.delete_object(Bucket=bucket, Key=filename)
            logger.info(f"File {filename} deleted successfully from {bucket}")
            return True
        except ClientError as e:
            logger.error(f"Error deleting file {filename} from bucket {bucket}: {e}")
            return False