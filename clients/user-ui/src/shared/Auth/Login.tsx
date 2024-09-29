'use client'
import styles from "@/src/utils/style";
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type LoginInput = z.infer<typeof formSchema>;

const Login = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LoginInput>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        console.log(data);
        reset();
    };

    return (
        <div>
            <h1 className={styles.title}>
                Login to Angel Delivery
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label className={styles.label}>Enter Your Email</label>
                <input
                    {...register('email')}
                    type="email"
                    placeholder="loginemail@example.com"
                    className={styles.input}
                />
                {errors.email && <span className="text-red-600 mt-1">{errors.email.message}</span>}
                <div className="w-full mt-5 relative mb-1">
                    <label htmlFor="password" className={styles.label}>Enter Your Password</label>
                    <input
                        {...register('password')}
                        type="password"
                        placeholder="********"
                        className={styles.input}
                    />
                    {errors.password && <span className="text-red-600 mt-1">{errors.password.message}</span>}
                </div>
                <div className="w-full mt-5">
                    <input 
                        type="submit"
                        value="Login"
                        disabled={isSubmitting}
                        className={styles.button}
                    />
                </div>
                <br />
            </form>
        </div>
    );
};

export default Login;