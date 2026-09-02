variable "Bucket-name" {
  type = string
  description = "Nome do bucket criado"
}

variable "Bucket-enviroment" {
  type = string
  description = "Ambiente em que o bucket foi criado"
}

variable "region" {
  type = string
  description = "Região em que o bucket foi criado"
  default = "sa-east-1"
}
