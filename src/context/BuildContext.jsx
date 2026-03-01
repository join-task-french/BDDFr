import { createContext, useContext, useReducer, useCallback } from 'react'

const BuildContext = createContext(null)

const INITIAL_STATE = {
  weapons: [null, null, null],
  weaponTalents: [null, null, null],
  gear: { masque: null, torse: null, holster: null, sac_a_dos: null, gants: null, genouilleres: null },
  gearTalents: { torse: null, sac_a_dos: null },
  skills: [null, null],
}

function buildReducer(state, action) {
  switch (action.type) {
    case 'SET_WEAPON': {
      const weapons = [...state.weapons]
      weapons[action.slot] = action.weapon
      const weaponTalents = [...state.weaponTalents]
      weaponTalents[action.slot] = null
      return { ...state, weapons, weaponTalents }
    }
    case 'REMOVE_WEAPON': {
      const weapons = [...state.weapons]
      weapons[action.slot] = null
      const weaponTalents = [...state.weaponTalents]
      weaponTalents[action.slot] = null
      return { ...state, weapons, weaponTalents }
    }
    case 'SET_WEAPON_TALENT': {
      const weaponTalents = [...state.weaponTalents]
      weaponTalents[action.slot] = action.talent
      return { ...state, weaponTalents }
    }
    case 'SET_GEAR': {
      const gear = { ...state.gear, [action.slot]: action.piece }
      const gearTalents = { ...state.gearTalents }
      if (action.slot === 'torse' || action.slot === 'sac_a_dos') {
        gearTalents[action.slot] = null
      }
      return { ...state, gear, gearTalents }
    }
    case 'REMOVE_GEAR': {
      const gear = { ...state.gear, [action.slot]: null }
      const gearTalents = { ...state.gearTalents }
      if (action.slot === 'torse' || action.slot === 'sac_a_dos') {
        gearTalents[action.slot] = null
      }
      return { ...state, gear, gearTalents }
    }
    case 'SET_GEAR_TALENT': {
      const gearTalents = { ...state.gearTalents, [action.slot]: action.talent }
      return { ...state, gearTalents }
    }
    case 'SET_SKILL': {
      const skills = [...state.skills]
      skills[action.slot] = action.skill
      return { ...state, skills }
    }
    case 'REMOVE_SKILL': {
      const skills = [...state.skills]
      skills[action.slot] = null
      return { ...state, skills }
    }
    case 'LOAD_BUILD':
      return { ...INITIAL_STATE, ...action.build }
    case 'RESET':
      return { ...INITIAL_STATE }
    default:
      return state
  }
}

export function BuildProvider({ children }) {
  const [state, dispatch] = useReducer(buildReducer, INITIAL_STATE)

  // Contraintes exotiques
  const hasExoticWeapon = state.weapons.some(w => w?.estExotique)
  const hasExoticGear = Object.values(state.gear).some(g => g?.estExotique)

  // Compétences déjà utilisées (par type)
  const usedSkillTypes = state.skills.filter(Boolean).map(s => s.competence)

  const canEquipExoticWeapon = useCallback((slot) => {
    if (!hasExoticWeapon) return true
    // Peut remplacer sa propre exotique
    return state.weapons[slot]?.estExotique === true
  }, [hasExoticWeapon, state.weapons])

  const canEquipExoticGear = useCallback((slot) => {
    if (!hasExoticGear) return true
    return state.gear[slot]?.estExotique === true
  }, [hasExoticGear, state.gear])

  const canEquipSkill = useCallback((skill, slot) => {
    const otherSlot = slot === 0 ? 1 : 0
    const otherSkill = state.skills[otherSlot]
    if (!otherSkill) return true
    return otherSkill.competence !== skill.competence
  }, [state.skills])

  const value = {
    ...state,
    dispatch,
    hasExoticWeapon,
    hasExoticGear,
    canEquipExoticWeapon,
    canEquipExoticGear,
    canEquipSkill,
    usedSkillTypes,
  }

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>
}

export function useBuild() {
  const ctx = useContext(BuildContext)
  if (!ctx) throw new Error('useBuild must be inside BuildProvider')
  return ctx
}

