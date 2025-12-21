import { notFound } from 'next/navigation';
import CompareContent from './CompareContent';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const params = await searchParams;
  const ids = params.ids;

  if (!ids) {
    notFound();
  }

  return <CompareContent ids={ids} />;
}
