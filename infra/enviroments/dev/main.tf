module "s3" {
  source = "../../modules/s3"

  Bucket-name       = "image-processing"
  Bucket-enviroment = "dev"
}

module "sqs" {
  source = "../../modules/sqs"

  sqs-queue-name       = "image-processing"
  sqs-queue-enviroment = "dev"
}
