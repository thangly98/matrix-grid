const form = document.querySelector('form')
const onSubmit = (e) => {
  e.preventDefault()

  const image = document.getElementById('image')
  const imageFile = image.files[0]
  const imageUrl = URL.createObjectURL(imageFile)

  const row = document.getElementById('row').value
  const col = document.getElementById('col').value

  const render = document.createElement('div')

  const matrix = document.createElement('div')
  matrix.classList.add(
    'matrix',
    'grid',
    `grid-rows-[repeat(${row},minmax(0,1fr))]`,
    'w-full',
    'mt-2',
    `aspect-[${col}/${row}]`,
    `bg-[url(${imageUrl})]`,
    'bg-cover',
    'bg-center'
  )
  for (let i = 0; i < row; i++) {
    const rowDiv = document.createElement('div')
    rowDiv.classList.add('grid', `grid-cols-[repeat(${col},minmax(0,1fr))]`)
    for (let j = 0; j < col; j++) {
      const colDiv = document.createElement('div')
      colDiv.classList.add('cell', 'border-[0.5px]', 'border-[rgb(0_0_0/40%)]')
      colDiv.onclick = () => ['checked', 'bg-[rgb(56_204_214/40%)]'].map((c) => colDiv.classList.toggle(c))
      rowDiv.appendChild(colDiv)
    }
    matrix.appendChild(rowDiv)
  }

  const buttonReset = document.createElement('button')
  buttonReset.classList.add('py-2', 'px-4', 'text-white', 'bg-red-500', 'rounded')
  buttonReset.textContent = 'Reset'
  buttonReset.onclick = () => {
    form.parentElement.classList.remove('hidden')
    render.remove()
  }

  const buttonSubmit = document.createElement('button')
  buttonSubmit.classList.add('py-2', 'px-4', 'ml-4', 'text-white', 'bg-green-500', 'rounded')
  buttonSubmit.textContent = 'Submit'
  buttonSubmit.onclick = () => {
    const matrixData = []
    const matrixNode = document.querySelector('.matrix')
    for (const row of matrixNode.childNodes) {
      const rowData = []
      for (const col of row.childNodes) {
        rowData.push({
          type: col.classList.contains('checked') ? 'collide' : 'way',
          anchor: false,
          dimensions: [1, 1],
        })
      }
      matrixData.push(rowData)
    }
    navigator.clipboard.writeText(JSON.stringify(matrixData)).then(() => {
      alert('Data copied to clipboard')
      form.parentElement.classList.remove('hidden')
      render.remove()
    })
  }

  form.reset()
  form.parentElement.classList.add('hidden')

  render.appendChild(buttonReset)
  render.appendChild(buttonSubmit)
  render.appendChild(matrix)
  document.body.appendChild(render)
}
form.addEventListener('submit', onSubmit)
