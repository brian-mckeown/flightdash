package com.myapps.flightdash.aspect;

import io.github.bucket4j.*;
import org.springframework.stereotype.Component;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.*;
import org.springframework.http.*;
import java.time.Duration;

@Aspect
@Component
public class RateLimiterAspect {

    private final Bucket bucket;

    public RateLimiterAspect() {
        Refill refill = Refill.greedy(100, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(100, refill).withInitialTokens(1);
        this.bucket = Bucket4j.builder().addLimit(limit).build();
    }

    @Around("@annotation(org.springframework.web.bind.annotation.RequestMapping) || @annotation(org.springframework.web.bind.annotation.GetMapping) || @annotation(org.springframework.web.bind.annotation.PostMapping)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        if (bucket.tryConsume(1)) {
            return joinPoint.proceed();
        } else {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("We are currently experiencing high traffic volume. Please try your request again in a couple of minutes");
        }
    }
}