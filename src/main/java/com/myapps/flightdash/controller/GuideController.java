package com.myapps.flightdash.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GuideController {

    @GetMapping("/guide")
    public String app() {
        // Return the view for "/app"
        return "guide";
    }
}