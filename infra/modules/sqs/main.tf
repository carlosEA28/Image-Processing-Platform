resource "aws_sqs_queue" "dead_letter" {
  name = "${var.sqs-queue-name}-dlq-${var.sqs-queue-enviroment}"

  message_retention_seconds = 1209600

  tags = {
    Iac         = "true"
    Environment = var.sqs-queue-enviroment
  }
}

resource "aws_sqs_queue" "this" {
  name = "${var.sqs-queue-name}-${var.sqs-queue-enviroment}"

  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dead_letter.arn
    maxReceiveCount     = 4
  })

  tags = {
    Iac         = "true"
    Environment = var.sqs-queue-enviroment
  }
}
