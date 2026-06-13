import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatMessageTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function formatConversationTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()

  if (isSameDay) {
    return formatMessageTime(value)
  }

  return dateTimeFormatter.format(date)
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "")

  if (digits.length === 13) {
    const countryCode = digits.slice(0, 2)
    const areaCode = digits.slice(2, 4)
    const prefix = digits.slice(4, 9)
    const suffix = digits.slice(9, 13)

    return `+${countryCode} (${areaCode}) ${prefix}-${suffix}`
  }

  if (digits.length === 12) {
    const countryCode = digits.slice(0, 2)
    const areaCode = digits.slice(2, 4)
    const prefix = digits.slice(4, 8)
    const suffix = digits.slice(8, 12)

    return `+${countryCode} (${areaCode}) ${prefix}-${suffix}`
  }

  return value
}

export function formatMessageStatus(status: string) {
  switch (status.toLowerCase()) {
    case "read":
      return "Lida"
    case "sent":
      return "Enviada"
    case "failed":
      return "Falhou"
    default:
      return status
  }
}
