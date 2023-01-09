export const CHART = {
  chart: {
    id: 'ticket-statistics',
    animations: {
      enabled: true,
      easing: 'easeout' as 'easeout',
      speed: 250,
      animateGradually: {
        enabled: false
      },
      dynamicAnimation: {
        enabled: true,
        speed: 250
      }
    },
    toolbar: {
      show: false
    },
  },
  colors: ['#ea2c04', '#006adc', '#18794e', '#5746af', '#ad5700'],
  dataLabels: {
    enabled: false
  },
  states: {
    normal: {
      filter: {
        type: 'none',
        value: 0,
      }
    },
    hover: {
      filter: {
        type: 'none',
        value: 0
      }
    },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: undefined
    },
  },
  grid: {
    show: false
  },
  xaxis: {
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        fontSize: '14px',
        fontFamily: 'Inter',
      },
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '14px',
        fontFamily: 'Inter',
      },
    }
  },
  legend: {
    fontSize: '14px',
    fontFamily: 'Inter',
  }
};