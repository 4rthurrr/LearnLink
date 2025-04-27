package com.learnlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "media")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Media {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    
    private String fileName;
    
    private String fileType;
    
    private String fileUrl;
    
    @Enumerated(EnumType.STRING)
    private MediaType type;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadedAt;
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = new Date();
    }
    
    public enum MediaType {
        IMAGE, 
        VIDEO, 
        DOCUMENT,
        AUDIO
    }
}
