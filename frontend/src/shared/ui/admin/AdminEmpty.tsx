interface AdminEmptyProps {
  message: string;
}

export const AdminEmpty = ({ message }: AdminEmptyProps): JSX.Element => {
  return <p className="admin-empty">{message}</p>;
};
