import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWhatsAppHref } from "@/lib/utils";

type CTAWhatsAppProps = {
  message: string;
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  showIcon?: boolean;
};

const FALLBACK_NUMBER = "5511999998888";

export function CTAWhatsApp({
  message,
  label = "Quero economizar",
  variant = "default",
  size = "lg",
  className,
  showIcon = true,
}: CTAWhatsAppProps) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
  const href = buildWhatsAppHref(number, message);

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} via WhatsApp`}
      >
        {showIcon ? <MessageCircle className="h-5 w-5" aria-hidden /> : null}
        {label}
      </a>
    </Button>
  );
}
