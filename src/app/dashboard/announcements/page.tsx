import { redirect } from 'next/navigation';

// Redirect to the proper announcements management page
export default function Page() {
  redirect('/dashboard/announcements-manage');
}
