import { ReleaseYearRangeEnum } from "./enums";

export function getRandomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export function getYearRangeForMongoDB(range: ReleaseYearRangeEnum) {
  switch (range) {
    case ReleaseYearRangeEnum.Earlier: {
      return { $lt: 1900 };
    }
    case ReleaseYearRangeEnum.y1900s: {
      return { $gte: 1900, $lt: 1910 };
    }
    case ReleaseYearRangeEnum.y1910s: {
      return { $gte: 1910, $lt: 1920 };
    }
    case ReleaseYearRangeEnum.y1920s: {
      return { $gte: 1920, $lt: 1930 };
    }
    case ReleaseYearRangeEnum.y1930s: {
      return { $gte: 1930, $lt: 1940 };
    }
    case ReleaseYearRangeEnum.y1940s: {
      return { $gte: 1940, $lt: 1950 };
    }
    case ReleaseYearRangeEnum.y1950s: {
      return { $gte: 1950, $lt: 1960 };
    }
    case ReleaseYearRangeEnum.y1960s: {
      return { $gte: 1960, $lt: 1970 };
    }
    case ReleaseYearRangeEnum.y1970s: {
      return { $gte: 1970, $lt: 1980 };
    }
    case ReleaseYearRangeEnum.y1980s: {
      return { $gte: 1980, $lt: 1990 };
    }
    case ReleaseYearRangeEnum.y1990s: {
      return { $gte: 1990, $lt: 2000 };
    }
    case ReleaseYearRangeEnum.y2000s: {
      return { $gte: 2000, $lt: 2010 };
    }
    case ReleaseYearRangeEnum.y2010s: {
      return { $gte: 2010, $lt: 2020 };
    }
    case ReleaseYearRangeEnum.y2020s: {
      return { $gte: 2020, $lt: 2030 };
    }
  }
}
