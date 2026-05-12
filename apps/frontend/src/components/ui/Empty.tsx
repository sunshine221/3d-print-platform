interface Props {
  message?: string;
}

export default function Empty({ message = '暂无数据' }: Props) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-4">&#9744;</div>
      <p>{message}</p>
    </div>
  );
}
