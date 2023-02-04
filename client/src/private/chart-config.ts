/**
 * This file contains configuration for the Apex charts used on the admin dashboard.
 */

const CHART_BASE = {
  chart: {
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

export const SALES_PER_DAY_CHART = {
  ...CHART_BASE,
  chart: {
    ...CHART_BASE,
    id: 'ticket-statistics-sales-per-day'
  }
};

export const TOTALS_CHART = {
  ...CHART_BASE,
  colors: ['#18794e', '#ea2c04'],
  chart: {
    ...CHART_BASE,
    stacked: true,
    stackType: "100%" as "100%",
    id: 'ticket-statistics-sales-per-day'
  },
  yaxis: {
    labels: {
      show: false
    }
  },
};
