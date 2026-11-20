import { AwardEdition, AwardCategory } from '@/constants/theme'

export const mockEdition2026: AwardEdition = {
  year: 2026,
  status: 'open',
  closesAt: '2026-12-15T23:59:59Z',
  categories: [
    {
      key: 'best-player',
      tone: 'honor',
      order: 1,
      title: 'Mejor Jugador del Año',
      description: 'El más destacado de la temporada. Tu voto premia talento y actitud.',
      nomineeIds: ['juan-perez', 'pedro-gomez', 'luis-ramos']
    },
    {
      key: 'best-team',
      tone: 'honor',
      order: 2,
      title: 'Mejor Equipo',
      description: 'El equipo con mejor rendimiento colectivo.',
      nomineeIds: ['fulbito-fc', 'unidos', 'los-pibes']
    },
    // Se pueden agregar más categorías...
  ],
}

export const mockNominees = {
  'juan-perez': { name: 'Juan Pérez', avatar: '/awards/avatar-juan.jpg' },
  'pedro-gomez': { name: 'Pedro Gómez', avatar: '/awards/avatar-pedro.jpg' },
  'luis-ramos': { name: 'Luis Ramos', avatar: '/awards/avatar-luis.jpg' },
  'fulbito-fc': { name: 'Fulbito FC', avatar: '/awards/logo-fulbito.jpg' },
  'unidos': { name: 'Unidos', avatar: '/awards/logo-unidos.jpg' },
  'los-pibes': { name: 'Los Pibes', avatar: '/awards/logo-pibes.jpg' },
}
