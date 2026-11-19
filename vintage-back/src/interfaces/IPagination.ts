export interface IPagination {
    limit: number
    page: number
    offset?: number
    total?: number
    total_page?: number
}

export interface IPaginated<T> {
    items: T[]
    pagination: IPagination
}
