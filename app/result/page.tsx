import ResultClient from "./ResultClient";

type PageProps = {
  searchParams: Promise<{ item?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const detected = params.item ?? "";
  return <ResultClient initialItem={detected} />;
}
