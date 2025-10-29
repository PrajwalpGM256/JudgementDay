interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-8 text-white">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
