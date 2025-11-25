import boto3
from botocore.exceptions import ClientError
import os
from fastapi import UploadFile, HTTPException
import uuid

class B2Storage:
    def __init__(self):
        self.endpoint_url = os.getenv("B2_ENDPOINT_URL")
        self.key_id = os.getenv("B2_KEY_ID")
        self.application_key = os.getenv("B2_APPLICATION_KEY")
        self.bucket_name = os.getenv("B2_BUCKET_NAME")

        if not all([self.endpoint_url, self.key_id, self.application_key, self.bucket_name]):
            print("⚠️  WARNING: B2 Storage credentials not fully configured.")
            self.s3_client = None
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=self.endpoint_url,
                    aws_access_key_id=self.key_id,
                    aws_secret_access_key=self.application_key
                )
            except Exception as e:
                print(f"❌ Error initializing B2 client: {e}")
                self.s3_client = None

    def upload_file(self, file: UploadFile) -> str:
        """
        Uploads a file to B2 bucket and returns the public URL or presigned URL
        """
        if not self.s3_client:
            raise HTTPException(status_code=503, detail="Storage service unavailable")

        # Generate a unique filename to avoid collisions
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        try:
            # Upload the file
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                unique_filename,
                ExtraArgs={'ContentType': file.content_type}
            )

            # For Backblaze B2, construct the Friendly URL format
            # Format: https://<bucket-name>.s3.<region>.backblazeb2.com/<key>
            # Extract region from endpoint (e.g., s3.eu-central-003.backblazeb2.com -> eu-central-003)
            region = self.endpoint_url.replace("https://s3.", "").replace(".backblazeb2.com", "")

            # Try friendly URL format first (works if bucket has public access)
            url = f"https://{self.bucket_name}.s3.{region}.backblazeb2.com/{unique_filename}"

            return url

        except ClientError as e:
            print(f"Error uploading file: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload file to storage")
        except Exception as e:
            print(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail="An unexpected error occurred during upload")

    def generate_presigned_url(self, file_key: str, expiration: int = 3600) -> str:
        """
        Generate a presigned URL for private bucket access
        expiration: URL validity in seconds (default 1 hour)
        """
        if not self.s3_client:
            raise HTTPException(status_code=503, detail="Storage service unavailable")

        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate download URL")

# Global instance
storage = B2Storage()
