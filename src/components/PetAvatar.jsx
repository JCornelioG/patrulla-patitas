import Icon, { speciesIcon } from './Icons';

// Avatar de la mascota: fotografía real si existe; si no, icono de la
// especie sobre el color suave del perfil (datos de prueba sin fotos
// genéricas de stock).
export default function PetAvatar({ pet, size = 'md' }) {
  const cls = size === 'lg' ? ' size-lg' : size === 'sm' ? ' size-sm' : '';
  const iconSize = size === 'lg' ? 40 : size === 'sm' ? 22 : 32;
  return (
    <div className={`pet-photo${cls}`} style={pet.bg ? { background: pet.bg } : undefined}>
      {pet.photoUrl ? (
        <img src={pet.photoUrl} alt={pet.name} />
      ) : (
        <Icon name={speciesIcon(pet.species)} size={iconSize} label={pet.species} />
      )}
    </div>
  );
}
