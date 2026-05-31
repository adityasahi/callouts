import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <div className="flex items-center justify-center gap-6 py-4 border-t border-border text-xs text-muted-foreground">
      <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
      <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
    </div>
  );
}