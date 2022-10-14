
const month = document.getElementById('myChart')
const week = document.getElementById('week')
const day = document.getElementById('day')

// function of month wise

fetch('/admin/dashboardMonth', {
  method:'get'
})
.then((value) => value.json())
.then((data) => {
  let axis = []
  let count  = []
  for (const value of data) {
    switch (value._id) {
    case 1:
    axis.push('January')
      break;
    case 2:
    axis.push('February')
      break;
    case 3:
    axis.push('March')
      break;
    case 4:
    axis.push('April')
      break;
    case 5:
    axis.push('May')
      break;
    case 6:
    axis.push('June')
      break;
    case 7:
    axis.push('July')
      break;
    case 8:
    axis.push('August')
      break;
    case 9:
    axis.push('September')
      break;
    case 10:
    axis.push('October')
      break;
    case 11:
    axis.push('November')
      break;
    case 12:
    axis.push('December')
      break;
    
  }
    
    count.push(value.count)
  }

  chart(axis , count )

  })
  function chart(axis , count) {
    const masspopChart = new Chart(month, {
            type: 'bar',
            data: {
                labels: [...axis],
                datasets: [{
                    label: 'Number of orders by Month',
                    data: [...count],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(245, 125, 75, 1.2)',
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
  }

// function of day wise graph

fetch('/admin/dashboardDay' , {
  method:'get'
})
.then((val) => val.json())
.then((data) => {
  console.log(data)
  let axis = []
  let count = []
  for (const val of data){
    let date = `${val.detail.day}/${val.detail.month}/${val.detail.year}`
    axis.push(date)
    count.push(val.count)
    // console.log(axis,count);
  }
const myChart = new Chart(day, {
    type: 'bar',
    data: {
        labels: [axis],
        datasets: [{
            label: 'Number of orders by Day',
            data: [count],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
})

//function of week wise graph

fetch('/admin/dashboardWeek' , {
method:'get'
}).then(data => data.json())
.then((data) => {
// console.log(data)
let xaxis = []
let count = []
for (const val of data) {
  let week = `${val.detail.week}`
  xaxis.push(week)
  count.push(val.count)
  console.log("xaxis:"+ xaxis)
  console.log("count:"+ count)
}
const myChart = new Chart(week, {
    type: 'pie',
    data: {
        labels: [xaxis],
        datasets: [{
            label: 'Number of orders by Week',
            data: [count],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
// const masspopChart = new Chart(week, {
//       type: 'doughnut',
//       data: {
//           labels: [...xaxis],
//           datasets: [{
//               label: 'Number of orders in a week',
//               data: [...counts],
//               backgroundColor: [
//                   'rgba(255, 99, 132, 0.2)',
//                   'rgba(54, 162, 235, 0.2)',
//                   'rgba(245, 125, 75, 1.2)',
//               ],
//               borderColor: [
//                   'rgba(255, 99, 132, 1)',
//                   'rgba(54, 162, 235, 1)',
//                   'rgba(255, 206, 86, 1)',
//                   'rgba(75, 192, 192, 1)',
//                   'rgba(153, 102, 255, 1)',
//                   'rgba(255, 159, 64, 1)'
//               ],
//               borderWidth: 1
//           }]
//       },
//       options: {
//           scales: {
//               y: {
//                   beginAtZero: true
//               }
//           }
//       }
//   })
})
