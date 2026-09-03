terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "aws_profile" {
  default = ""
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile != "" ? var.aws_profile : null

  skip_credentials_validation = var.aws_profile == ""
  skip_metadata_api_check     = var.aws_profile == ""
  skip_requesting_account_id  = var.aws_profile == ""

  endpoints {
    s3  = var.aws_profile == "" ? "http://localhost:4566" : null
    sqs = var.aws_profile == "" ? "http://localhost:4566" : null
  }

  access_key = var.aws_profile == "" ? "test" : null
  secret_key = var.aws_profile == "" ? "test" : null
}
