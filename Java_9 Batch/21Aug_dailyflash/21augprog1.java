import java.io.*;

class area {
	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr); 


		double r = Double.parseDouble(br.readLine());

		double area;

		area = 3.14 * r * r;

		System.out.println("area of circle:"+area);

	}

}	
		

