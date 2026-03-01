import DataTable from './DataTable'

export default function CategorySection({ category, items, searchTerm }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-sm uppercase tracking-widest">
          {searchTerm ? 'Aucun résultat trouvé' : 'Aucune donnée disponible'}
        </p>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest">
          <span className="mr-2">{category?.icon}</span>
          {category?.label}
        </h3>
        <span className="text-xs text-gray-500 font-bold">{items.length} entrées</span>
      </div>
      <DataTable items={items} />
    </div>
  )
}

