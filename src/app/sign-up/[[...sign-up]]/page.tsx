import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-20 px-4 flex items-center justify-center" style={{ background: "#f8edd6" }}>
      <SignUp />
    </div>
  );
}
