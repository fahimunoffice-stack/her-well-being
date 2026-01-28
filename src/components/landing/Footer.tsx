import { Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</p>
            <p className="text-sm text-muted-foreground">যেকোনো প্রয়োজনে নিচের অপশনগুলোতে যোগাযোগ করুন</p>
          </div>

          <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <li>
              <a
                href="https://facebook.com/homedoctooor"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Facebook Page খুলুন"
              >
                <Facebook className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a
                href="tel:+8801886841232"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="ফোন করুন 01886841232"
              >
                <Phone className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span>01886841232</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:akibhasan325@gmail.com"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="ইমেইল করুন akibhasan325@gmail.com"
              >
                <Mail className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="truncate">akibhasan325@gmail.com</span>
              </a>
            </li>
          </ul>

          <div className="h-px w-full bg-border" aria-hidden="true" />

          <div className="text-center text-xs leading-relaxed text-muted-foreground">
            <span>
              © 2026 <span className="font-medium text-foreground">Home Doctor</span>
            </span>
            <span className="mx-2">·</span>
            <span>
              Developed by{" "}
              <a
                href="https://vibeacademy.app/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Vibe Academy
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
