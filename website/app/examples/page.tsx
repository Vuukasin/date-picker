import Examples from "@/sections/examples";

const Page = ({ searchParams: { i } }: { searchParams: { i?: string } }) => {
  return (
    <main>
      <Examples exampleIdx={Number(i)} />
    </main>
  );
};

export default Page;
