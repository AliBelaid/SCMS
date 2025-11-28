export interface TableColumn<T> {
  options?: any;
  label: string;
  property: string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' |'date' |'select' | 'number' |'labels';
  visible?: boolean;
  cssClasses?: string[];
  matColumnDef?: string;
  matHeaderRowDef?: string;
}
