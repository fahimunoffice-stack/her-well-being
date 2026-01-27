import { Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Contact</span>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm md:flex-row md:gap-6">
            <a
              href="https://facebook.com/homedoctooor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Facebook className="h-4 w-4" />
              <span>Facebook Page</span>
            </a>
            <a
              href="tel:+8801886841232"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Phone className="h-4 w-4" />
              <span>Mobile: 01886841232</span>
            </a>
            <a
              href="mailto:akibhasan325@gmail.com"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              <span>akibhasan325@gmail.com</span>
            </a>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <span>
              © 2026 <span className="font-medium text-foreground">Home Doctor</span>
            </span>
            <span className="mx-2">·</span>
            <span>
              Developed by <span className="font-medium text-foreground">Vibe Tech</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
