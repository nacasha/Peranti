interface Base {
  areaType?: "flex" | "grid"
  fieldsType?: "flex" | "grid"
}

interface AreaTypeFlex {
  areaType?: "flex"

  /**
   * Input and output placement when using flex areaType
   */
  areaFlexDirection?: "horizontal" | "vertical"
}

interface AreaTypeGrid {
  areaType?: "grid"

  /**
   * Define input and output position using gridTemplate when areaType is grid
   */
  areaGridTemplate?: string
}

interface FieldsTypeFlex {
  /**
   * There are two types of layout, grid and flex
   * - Flex is much simpler than flex, only define the fields placement direction
   * - Grid have more controls over individual field
   */
  fieldsType?: "flex"

  /**
   * Input area flex direction when layout type is flex
   */
  fieldsInputFlexDirection?: "horizontal" | "vertical"

  /**
   * Output area flex direction when layout type is flex
   */
  fieldsOutputFlexDirection?: "horizontal" | "vertical"
}

interface FieldsTypeGrid {
  /**
   * There are two types of layout, grid and flex
   * - Flex is much simpler than flex, only define the fields placement direction
   * - Grid have more controls over individual field
   */
  fieldsType?: "grid"

  /**
   * Input area gridTemplate when layout type is grid
   */
  fieldsInputGridTemplate?: string

  /**
   * Output area gridTemplate when layout type is grid
   */
  fieldsOutputGridTemplate?: string
}

export type LayoutSetting = Base & (AreaTypeFlex | AreaTypeGrid) & (FieldsTypeFlex | FieldsTypeGrid)
