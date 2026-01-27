import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminErrorScreen({
  title,
  description,
  onRetry,
}: {
  title: string;
  description?: string;
  onRetry: () => void | Promise<void>;
}) {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full">
            Retry
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/">← Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
