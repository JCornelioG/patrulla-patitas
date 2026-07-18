// Avatar de la mascota: foto real si existe, si no el emoji ilustrado.
export default function PetAvatar({ pet, size = 56 }) {
  return (
    <div
      className="pet-avatar"
      style={{ width: size, height: size, background: pet.bg, fontSize: size * 0.52 }}
      aria-label={pet.name}
    >
      {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} /> : pet.emoji}
    </div>
  );
}
