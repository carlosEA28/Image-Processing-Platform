module "s3" {
  source = "../../modules/s3"

  Bucket-name       = "image-processing-cadu"
  Bucket-enviroment = "prod"
}

module "sqs" {
  source = "../../modules/sqs"

  sqs-queue-name       = "image-processing-cadu"
  sqs-queue-enviroment = "prod"
}
