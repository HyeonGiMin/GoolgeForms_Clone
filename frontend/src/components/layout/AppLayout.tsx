// AppLayout.tsx - 기본 레이아웃(헤더/메인 컨테이너)을 제공하는 컴포넌트
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";

type AppLayoutProps = {
    children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <div className="app-root">
            <Navbar bg="light" expand="sm" className="shadow-sm mb-3">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/forms">
                        Google Forms Clone
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse
                        id="main-navbar"
                        className="justify-content-end"
                    >
                        <Nav>
                            <Nav.Link as={NavLink} to="/forms">
                                Forms
                            </Nav.Link>
                            <Nav.Link as={NavLink} to="/forms/new">
                                New Form
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="app-main pb-4">{children}</Container>
        </div>
    );
};
