variable "sqs-queue-name" {
  type = string
  description = "Fila sqs"
  default = ""
}

variable "sqs-queue-enviroment" {
  type = string
  default = "Ambiente em que a fila foi criada"
}
