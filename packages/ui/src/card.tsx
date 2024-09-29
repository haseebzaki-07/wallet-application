import React from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="border p-4  p-3 rounded-lg shadow-lg border-grey-200"
    >
      <h1 className="text-xl border-b pb-2 ">
        {title}
      </h1>
      <p>{children}</p>
    </div>
  );
}