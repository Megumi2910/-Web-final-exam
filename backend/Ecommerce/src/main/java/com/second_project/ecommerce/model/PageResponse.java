package com.second_project.ecommerce.model;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Paginated response wrapper for REST API
 */
public class PageResponse<T> extends ApiResponse<List<T>> {
    
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;

    public PageResponse() {}

    public PageResponse(boolean success, String message, List<T> data, 
                       int pageNumber, int pageSize, long totalElements, int totalPages) {
        super(success, message, data);
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.last = (pageNumber + 1) >= totalPages;
        this.first = pageNumber == 0;
    }

    public static <T> PageResponse<T> success(String message, List<T> data,
                                              int pageNumber, int pageSize, 
                                              long totalElements, int totalPages) {
        return new PageResponse<>(true, message, data, pageNumber, pageSize, totalElements, totalPages);
    }

    public static <T> PageResponse<T> of(Page<T> page, String message) {
        return new PageResponse<>(
            true,
            message,
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }

    // Getters and Setters
    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }
}
