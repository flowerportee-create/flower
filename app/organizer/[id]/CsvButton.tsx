export default function CsvButton({
  projectId,
  projectTitle
}: {
  projectId: string;
  projectTitle: string;
}) {
  return (
    <a
      href={`/organizer/${projectId}/csv`}
      className="btn-secondary text-xs"
      aria-label={`${projectTitle} の参加者一覧をCSVでダウンロード`}
    >
      CSV出力
    </a>
  );
}
