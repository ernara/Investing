Last updated: 2026-07-24

# Investing

Small static website for comparing ETF data and testing long-term investing scenarios.

Live website: https://ernara.github.io/Investing/

## Projects

### ETF Palyginimas

ETF comparison and screening tool.

Main things it does:

* shows ETF cards
* compares ETFs by TER, countries, continents and other data
* uses local JSON data files
* supports filters and sorting
* supports dark/light theme
* works on desktop and mobile

Open directly:

https://ernara.github.io/Investing/etf.html

### Investavimo Palyginimas

Investment comparison calculator.

Main things it does:

* compares investing scenarios by user inputs
* shows investment growth chart
* shows result summary and history
* supports CSV export
* supports dark/light theme
* works on desktop and mobile

Open directly:

https://ernara.github.io/Investing/investing.html

### Bruto / Neto

Lithuanian 2026 salary calculator.

Main things it does:

* calculates monthly bruto and neto salary
* supports hourly pay with a monthly work calendar
* includes night and holiday multipliers
* supports bonuses, NPD and second-pillar pension settings
* provides monthly and yearly views
* shares the same navigation and dark/light theme as the other projects
* works on desktop and mobile

Open directly:

https://ernara.github.io/Investing/salary-calculator.html

## Technologies

This project is intentionally simple and static.

Used:

* HTML
* CSS
* JavaScript
* JSON
* Chart.js

No backend is required.

## Project structure

```txt
Investing/
  index.html
  etf.html
  investing.html
  salary-calculator.html

  css/
  js/
  data/
```

## Data

ETF data is stored in the `data/` folder.

The data is separated by TER files, for example:

```txt
ter-0.03.json
ter-0.04.json
ter-0.05.json
```

Country safety/preference data is stored in:

```txt
country-investment-tier.json
```

## Notes

This project is for personal research, comparison and learning.

It is not financial advice.
