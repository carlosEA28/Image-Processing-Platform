resource "aws_s3_bucket" "bucket" {
  bucket = "${var.Bucket-name}-${var.Bucket-enviroment}"

  tags = {
    Iac = true
    Environment = var.Bucket-enviroment
  }
}
