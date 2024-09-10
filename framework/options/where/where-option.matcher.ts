import { PrimitiveValue } from "framework/common";
import { AdvancedWhereOption, WhereOption } from "./types";

export class WhereOptionMatcher {
  checkIsMatching<T extends PrimitiveValue>(value: T, whereOption: WhereOption<T>): boolean {
    if (typeof whereOption === "object" && whereOption !== null) {
      return this.checkIsMatchingByAdvancedOption(value, whereOption);
    }

    return this.checkIsMatchingByAdvancedOption(value as PrimitiveValue, { equalsTo: whereOption });
  }

  private checkIsMatchingByAdvancedOption<T extends PrimitiveValue>(
    value: T,
    whereOption: AdvancedWhereOption<T>
  ): boolean {
    switch (typeof value) {
      case "number":
        return this.checkIsMatchingNumber(value, whereOption as any);

      case "string":
        return this.checkIsMatchingString(value, whereOption as any);

      default:
        return value === whereOption.equalsTo;
    }
  }

  private checkIsMatchingNumber(value: number, whereOption: AdvancedWhereOption<number>) {
    if ("equalsTo" in whereOption) {
      return value === whereOption.equalsTo;
    }

    /** Returns false if option value by key is not a number and validating it either */
    const checkOption = (key: keyof typeof whereOption, callback: (optionValue: number) => boolean) => {
      return typeof whereOption[key] !== "number" || callback(whereOption[key]!);
    };

    const isLessThan = checkOption("lessThan", (optionValue) => value < optionValue);
    const isMoreThan = checkOption("moreThan", (optionValue) => value > optionValue);
    const isLessThanOrEquals = checkOption("lessThanOrEquals", (optionValue) => value <= optionValue);
    const isMoreThanOrEquals = checkOption("moreThanOrEquals", (optionValue) => value >= optionValue);

    return isLessThan && isLessThanOrEquals && isMoreThan && isMoreThanOrEquals;
  }

  private checkIsMatchingString(value: string, whereOption: AdvancedWhereOption<string>) {
    if (typeof whereOption.pattern !== "undefined") {
      return new RegExp(whereOption.pattern).test(value);
    }

    if (typeof whereOption.equalsTo !== "undefined") {
      return value === whereOption.equalsTo;
    }

    const isContains = !whereOption.contains || value.includes(whereOption.contains);
    const isStartsWith = !whereOption.startsWith || value.startsWith(whereOption.startsWith);
    const isEndsWith = !whereOption.endsWith || value.endsWith(whereOption.endsWith);

    return isContains && isStartsWith && isEndsWith;
  }
}
