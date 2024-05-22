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
    'bg-center',
    'relative'
  )
  matrix.addEventListener('pointerdown', createSelectAreaDiv)
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
    URL.revokeObjectURL(imageUrl)
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
    navigator.clipboard.writeText(JSON.stringify(matrixData)).then(() => alert('Data copied to clipboard'))
  }

  form.reset()
  form.parentElement.classList.add('hidden')

  render.appendChild(buttonReset)
  render.appendChild(buttonSubmit)
  render.appendChild(matrix)
  document.body.appendChild(render)
}
form.addEventListener('submit', onSubmit)

// Select area
function checkSelected(selectAreaElem) {
  const selectables = []

  const matrixNode = document.querySelector('.matrix')
  for (const row of matrixNode.childNodes) {
    for (const col of row.childNodes) {
      selectables.push(col)
    }
  }

  for (const selectable of selectables) {
    if (!selectable.classList.contains('checked')) {
      if (checkRectIntersection(selectAreaElem.getBoundingClientRect(), selectable.getBoundingClientRect()))
        selectable.classList.add('checked-temporary', 'bg-[rgb(56_204_214/40%)]')
      else selectable.classList.remove('checked-temporary', 'bg-[rgb(56_204_214/40%)]')
    }
  }
}

function checkRectIntersection(r1, r2) {
  // https://stackoverflow.com/a/13390495
  return !(r1.x + r1.width < r2.x || r2.x + r2.width < r1.x || r1.y + r1.height < r2.y || r2.y + r2.height < r1.y)
}

async function createSelectAreaDiv(event) {
  // https://stackoverflow.com/a/75902998
  event.preventDefault()
  const x = event.pageX
  const y = event.pageY

  const matrixNode = document.querySelector('.matrix')

  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.width = '0'
  div.style.height = '0'
  div.style.left = x + 'px'
  div.style.top = y + 'px'
  matrixNode.append(div)

  function resize(event) {
    const diffX = event.pageX - x
    const diffY = event.pageY - y
    div.style.left = diffX < 0 ? x + diffX - 8 + 'px' : x - 8 + 'px'
    div.style.top = diffY < 0 ? y + diffY - 40 - 16 + 'px' : y - 40 - 16 + 'px'
    div.style.height = Math.abs(diffY) + 'px'
    div.style.width = Math.abs(diffX) + 'px'
    div.classList.add('border', 'border-dashed', 'border-white')
    checkSelected(div) // extra line 1
  }

  matrixNode.addEventListener('pointermove', resize)
  matrixNode.addEventListener('pointerup', () => {
    matrixNode.removeEventListener('pointermove', resize)
    document.querySelectorAll('.checked-temporary').forEach((el) => el.classList.replace('checked-temporary', 'checked'))
    div.remove()
  })
}
