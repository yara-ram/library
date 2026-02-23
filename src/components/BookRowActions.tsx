import LinkButton from "@/components/LinkButton";
import InlineActionButtons from "@/components/InlineActionButtons";

export default function BookRowActions({
  bookId,
  bookStatus,
  openLoanBorrowerId,
  actorId,
  actorRole
}: {
  bookId: string;
  bookStatus: string;
  openLoanBorrowerId: string | null;
  actorId: string;
  actorRole: string | null;
}) {
  const canManage = actorRole === "ADMIN" || actorRole === "LIBRARIAN";
  const canMemberCheckIn = actorRole !== "MEMBER" || openLoanBorrowerId === actorId;

  return (
    <div className="flex items-center gap-2">
      <LinkButton href={`/books/${bookId}`}>View</LinkButton>
      <InlineActionButtons
        bookId={bookId}
        bookStatus={bookStatus}
        openLoanBorrowerId={openLoanBorrowerId}
        showArchiveActions={canManage}
        showCheckIn={canMemberCheckIn}
      />
    </div>
  );
}
