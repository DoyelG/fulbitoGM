import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function toDataUrl(relativePath: string): string {
  const absPath = path.join(__dirname, '../../web/public', relativePath)
  const buffer = fs.readFileSync(absPath)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

const players = [
  // Boca Juniors - Campeones Intercontinental 2000 vs Real Madrid
  { name: 'Óscar Córdoba',       position: 'Arquero',        skill: 8.5, photoUrl: toDataUrl('/players/oscar-cordoba.jpg'),        skills: { pace: 5, shooting: 2, passing: 6, dribbling: 4, defending: 9, physical: 8 } },
  { name: 'Hugo Ibarra',         position: 'Defensor',       skill: 7.5, photoUrl: null,                                              skills: { pace: 7, shooting: 4, passing: 7, dribbling: 6, defending: 9, physical: 8 } },
  { name: 'Jorge Bermúdez',      position: 'Defensor',       skill: 8.0, photoUrl: null,                                              skills: { pace: 6, shooting: 4, passing: 7, dribbling: 5, defending: 9, physical: 9 } },
  { name: 'Cristián Traverso',   position: 'Defensor',       skill: 7.0, photoUrl: null,                                              skills: { pace: 7, shooting: 3, passing: 6, dribbling: 5, defending: 8, physical: 8 } },
  { name: 'Aníbal Matellán',     position: 'Defensor',       skill: 7.0, photoUrl: null,                                              skills: { pace: 6, shooting: 3, passing: 6, dribbling: 5, defending: 8, physical: 8 } },
  { name: 'Sebastián Battaglia', position: 'Mediocampista',  skill: 8.0, photoUrl: toDataUrl('/players/sebastian-battaglia.jpg'),     skills: { pace: 7, shooting: 6, passing: 8, dribbling: 7, defending: 8, physical: 8 } },
  { name: 'Mauricio Serna',      position: 'Mediocampista',  skill: 7.5, photoUrl: toDataUrl('/players/mauricio-serna.jpg'),          skills: { pace: 7, shooting: 6, passing: 8, dribbling: 7, defending: 7, physical: 7 } },
  { name: 'José Basualdo',       position: 'Mediocampista',  skill: 7.0, photoUrl: null,                                              skills: { pace: 6, shooting: 6, passing: 7, dribbling: 6, defending: 7, physical: 7 } },
  { name: 'Juan Román Riquelme', position: 'Mediocampista',  skill: 9.5, photoUrl: toDataUrl('/players/juan-roman-riquelme.jpg'),     skills: { pace: 6, shooting: 8, passing: 10, dribbling: 9, defending: 4, physical: 6 } },
  { name: 'Marcelo Delgado',     position: 'Delantero',      skill: 7.5, photoUrl: null,                                              skills: { pace: 8, shooting: 7, passing: 6, dribbling: 7, defending: 3, physical: 7 } },
  { name: 'Martín Palermo',      position: 'Delantero',      skill: 9.0, photoUrl: toDataUrl('/players/martin-palermo.jpg'),          skills: { pace: 7, shooting: 9, passing: 6, dribbling: 7, defending: 3, physical: 8 } },
  // Resto
  { name: 'Ariel',     position: 'Mediocampista', skill: 7.5, photoUrl: null, skills: { pace: 7, shooting: 7, passing: 8, dribbling: 8, defending: 6, physical: 7 } },
  { name: 'Lucas',     position: 'Delantero',     skill: 8.0, photoUrl: null, skills: { pace: 9, shooting: 8, passing: 7, dribbling: 8, defending: 3, physical: 7 } },
  { name: 'Matías',    position: 'Defensor',      skill: 7.0, photoUrl: null, skills: { pace: 6, shooting: 4, passing: 7, dribbling: 5, defending: 9, physical: 8 } },
  { name: 'Nicolás',   position: 'Delantero',     skill: 6.5, photoUrl: null, skills: { pace: 8, shooting: 7, passing: 6, dribbling: 7, defending: 3, physical: 6 } },
  { name: 'Facundo',   position: 'Mediocampista', skill: 7.0, photoUrl: null, skills: { pace: 7, shooting: 6, passing: 8, dribbling: 7, defending: 7, physical: 6 } },
  { name: 'Gonzalo',   position: 'Defensor',      skill: 6.5, photoUrl: null, skills: { pace: 6, shooting: 4, passing: 6, dribbling: 5, defending: 8, physical: 8 } },
  { name: 'Tomás',     position: 'Delantero',     skill: 8.5, photoUrl: null, skills: { pace: 9, shooting: 9, passing: 7, dribbling: 8, defending: 3, physical: 7 } },
  { name: 'Diego',     position: 'Mediocampista', skill: 7.5, photoUrl: null, skills: { pace: 7, shooting: 7, passing: 9, dribbling: 7, defending: 6, physical: 6 } },
  { name: 'Ramiro',    position: 'Arquero',       skill: 7.0, photoUrl: null, skills: { pace: 5, shooting: 3, passing: 5, dribbling: 4, defending: 8, physical: 7 } },
]

async function main() {
  await prisma.player.deleteMany()
  console.log('Seeding players...')

  for (const player of players) {
    await prisma.player.create({ data: player })
  }

  console.log(`Created ${players.length} players.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
